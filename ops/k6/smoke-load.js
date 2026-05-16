import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://lfcs-dashboard:3000';

export const options = {
  scenarios: {
    smoke_load: {
      executor: 'constant-vus',
      vus: 3,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const endpoints = ['/', '/login', '/healthz', '/readyz'];

  for (const path of endpoints) {
    const response = http.get(`${BASE_URL}${path}`, {
      tags: {
        endpoint: path,
      },
    });

    check(response, {
      [`${path} returned 2xx`]: (r) => r.status >= 200 && r.status < 300,
    });
  }

  sleep(1);
}
