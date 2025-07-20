// Simple test for token image endpoint
const testImageEndpoint = async () => {
  const apiKey = 'test-api-key-123';
  const tokens = ['WETH', 'USDC', 'DAI', 'USDT', 'WBTC', 'INVALIDTOKEN', 'FAKETOKEN'];
  
  try {
    console.log('🔑 Getting JWT token...');
    
    const tokenResponse = await fetch('http://localhost:3000/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ Token error:', await tokenResponse.text());
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token response:', tokenData);
    
    let jwtToken = tokenData.data?.token || tokenData.token || tokenData.access_token;
    if (!jwtToken) {
      console.error('❌ No token found');
      return;
    }
    
    console.log('🔑 Testing image endpoint...');
    const imageUrl = `http://localhost:3000/api/tokens/images/batch?symbols=${tokens.join(',')}`;
    
    const imageResponse = await fetch(imageUrl, {
      headers: { 
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Image status:', imageResponse.status);
    
    if (!imageResponse.ok) {
      console.error('❌ Image error:', await imageResponse.text());
      return;
    }
    
    const imageData = await imageResponse.json();
    console.log('✅ Image response:', JSON.stringify(imageData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testImageEndpoint(); 