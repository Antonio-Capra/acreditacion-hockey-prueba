#!/usr/bin/env node

const http = require('http');

const checkHeaders = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'HEAD',
  };

  const req = http.request(options, (res) => {
    console.log('\n✅ SECURITY HEADERS TEST\n');
    console.log('Status:', res.statusCode);
    console.log('\n📋 Headers recibidos:\n');

    const headers = res.headers;
    let allPassed = true;

    // Verificar headers requeridos
    const headersToCheck = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy',
      'strict-transport-security',
      'content-security-policy',
    ];

    headersToCheck.forEach((header) => {
      const value = headers[header];
      if (value) {
        console.log(`✓ ${header}: ${value}`);
      } else {
        console.log(`✗ ${header}: MISSING`);
        allPassed = false;
      }
    });

    console.log('\n');
    if (allPassed) {
      console.log('✅ Todos los security headers están presentes');
      process.exit(0);
    } else {
      console.log('❌ Algunos security headers están faltando');
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.error('Error conectando al servidor:', error.message);
    console.log('\nIntentando nuevamente en 3 segundos...');
    setTimeout(checkHeaders, 3000);
  });

  req.end();
};

// Esperar 2 segundos para que el servidor inicie
setTimeout(checkHeaders, 2000);
