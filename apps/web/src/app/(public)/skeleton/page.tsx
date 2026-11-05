"use client";

import React from 'react'
// import SkeletonAddFriends from '@/app/(private)/add-friends/skeleton';
import { SkeletonTabs, SkeletonRanking } from '@/app/(private)/ranking/skeleton';

const SkeletonPage = () => {
  return (
    <div className="flex flex-col h-screen gap-4 p-4">
      <SkeletonTabs />
      <SkeletonRanking />
    </div>
  );
};

export default SkeletonPage;
