import { lazy, Suspense } from 'react'
import { KeepAlive } from 'react-activation'

import { MainLayout } from '@/components/layout'
import EarningsHistory from '@/components/PersonalDetails/Earnings/History'

import Splash from '@/pages/Splash'
import Shares from '@/pages/Shares'
import Profile from '@/pages/Profile'
import Follow from '@/pages/Follow'
import AgeGate from '@/pages/AgeGate'
import { NewPost } from '@/pages/NewPost'
import ProfileEdit from '@/pages/Profile/edit'
import Searching from '@/pages/Home/Searching'
import Christmas from '@/pages/Home/Christmas'
import OthersProfile from '@/pages/OthersProfile'
import ProfileGuard from '@/pages/OthersProfile/routeGuard'
import MessagePageRouteGuard from '@/pages/Chat/MessagePageRouteGuard'

const Task = lazy(() => import('@/pages/Task'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full pb-10">
    <i
      className="iconfont icon-loading animate-spin text-[#6254FF]"
      style={{ fontSize: '40px' }}
    />
  </div>
)

export const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Splash /> },
      {
        path: 'home',
        element: <div></div>,
      },
      { path: 'searching', element: <Searching /> },
      { path: 'christmas', element: <Christmas /> },
      { path: 'post', element: <NewPost /> },
      { path: 'shares', element: <Shares /> },
      {
        path: 'task',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Task />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={null}>
                <KeepAlive name="profile">
                  <Profile />
                </KeepAlive>
              </Suspense>
            ),
          },
          { path: 'edit', element: <ProfileEdit /> },
          { path: 'earningsHistory', element: <EarningsHistory /> },
          {
            path: ':uid',
            element: (
              <ProfileGuard>
                <OthersProfile />
              </ProfileGuard>
            ),
          },
        ],
      },
      { path: 'follow/:uid', element: <Follow /> },
      { path: 'chat', element: <></> },
      { path: 'chat/:uid', element: <MessagePageRouteGuard /> },
      { path: 'ageGate', element: <AgeGate /> },
    ],
  },
]
