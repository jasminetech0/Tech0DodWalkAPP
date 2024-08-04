"use client";  // クライアントコンポーネントとして指定します

import React from 'react';
import Link from 'next/link';

const Top = () => {
  return (
    <div>
      <h1>トップページ</h1>
      <Link href="/walk_record">
        <button>散歩</button>
      </Link>
    </div>
  );
};

export default Top;
