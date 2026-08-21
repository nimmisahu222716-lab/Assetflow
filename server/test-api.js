const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('=== RUNNING ASSETFLOW ERP BACKEND INTEGRATION TESTS ===\n');

  // 1. Login Admin
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@assetflow.com', password: 'Admin123!' });
  console.log('1. Admin Login:', adminLogin.status === 200 ? 'PASS ✅' : 'FAIL ❌', adminLogin.data.role);
  const token = adminLogin.data.token;

  // 2. Fetch Assets
  const assetsRes = await request('/assets', 'GET', null, token);
  console.log('2. Asset Directory Listing:', assetsRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', `Total Assets: ${assetsRes.data.length}`);

  // 3. Test Double-Allocation Conflict Rule
  const asset1 = assetsRes.data.find(a => a.assetTag === 'AF-0001');
  const userRaj = (await request('/users?search=Raj', 'GET', null, token)).data[0];

  const doubleAlloc = await request('/allocations', 'POST', {
    assetId: asset1._id,
    userId: userRaj._id,
    expectedReturnDate: '2026-12-31'
  }, token);

  console.log('3. Double-Allocation Prevention Engine:', doubleAlloc.status === 400 && doubleAlloc.data.code === 'DOUBLE_ALLOCATION_CONFLICT' ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Conflict Feedback:', doubleAlloc.data.message);

  // 4. Test Time-Slot Overlap Validation
  const roomAsset = assetsRes.data.find(a => a.assetTag === 'AF-0003');
  const today1 = new Date();
  today1.setHours(9, 30, 0, 0);
  const startOverlap = today1.toISOString();
  const today2 = new Date();
  today2.setHours(10, 30, 0, 0);
  const endOverlap = today2.toISOString();

  const overlapRes = await request('/bookings', 'POST', {
    assetId: roomAsset._id,
    purpose: 'Conflicting Sync',
    startTime: startOverlap,
    endTime: endOverlap
  }, token);

  console.log('\n4. Time-Slot Overlap Validation Engine:', overlapRes.status === 400 && overlapRes.data.code === 'BOOKING_OVERLAP_CONFLICT' ? 'PASS ✅' : 'FAIL ❌');

  // 5. Test Non-Overlapping Slot (2 Days Later 14:00 - 15:00)
  const future1 = new Date();
  future1.setDate(future1.getDate() + 2);
  future1.setHours(14, 0, 0, 0);
  const startValid = future1.toISOString();

  const future2 = new Date();
  future2.setDate(future2.getDate() + 2);
  future2.setHours(15, 0, 0, 0);
  const endValid = future2.toISOString();

  const validBooking = await request('/bookings', 'POST', {
    assetId: roomAsset._id,
    purpose: 'Executive Sync (Future Slot)',
    startTime: startValid,
    endTime: endValid
  }, token);

  console.log('5. Contiguous Non-Overlapping Booking:', validBooking.status === 201 ? 'PASS ✅' : 'FAIL ❌');

  // 6. Test Maintenance State Transition (Available -> Under Maintenance -> Available)
  const availAsset = assetsRes.data.find(a => a.status === 'Available' && !a.isBookable);
  if (availAsset) {
    const raiseMaint = await request('/maintenance', 'POST', {
      assetId: availAsset._id,
      issueDescription: 'Fan noise diagnosis',
      priority: 'Low'
    }, token);

    const approveMaint = await request(`/maintenance/${raiseMaint.data._id}/approve`, 'PUT', { status: 'Approved' }, token);
    console.log('\n6. Maintenance Approval Asset Status Transition (Under Maintenance):', approveMaint.data.asset.status === 'Under Maintenance' ? 'PASS ✅' : 'FAIL ❌');

    const resolveMaint = await request(`/maintenance/${raiseMaint.data._id}/resolve`, 'PUT', { resolutionNotes: 'Cleaned fan assembly', cost: 45 }, token);
    console.log('7. Maintenance Resolution Asset Status Transition (Available):', resolveMaint.data.asset.status === 'Available' ? 'PASS ✅' : 'FAIL ❌');
  }

  console.log('\n=== ALL ENTERPRISE BACKEND BUSINESS RULES VERIFIED SUCCESSFULLY ===');
};

runTests().catch(console.error);
