import { lazy, Suspense } from 'react'
import { KeepAlive } from 'react-activation'

import { MainLayout } from '@/components/layout'
import EarningsHistory from '@/components/PersonalDetails/Earnings/History'

import Splash from '@/pages/Splash'
import Shares from '@/pages/Shares'
import Test from '@/pages/Test'
import Profile from '@/pages/Profile'
import Earnings from '@/pages/Profile/earnings'
import Follow from '@/pages/Follow'
import AgeGate from '@/pages/AgeGate'
import { NewPost } from '@/pages/NewPost'
import ProfileEdit from '@/pages/Profile/edit'
import Searching from '@/pages/Home/Searching'
import Christmas from '@/pages/Home/Christmas'
import JKFCampaign from '@/pages/Home/JKFCampaign'
import OthersProfile from '@/pages/OthersProfile'
import ProfileGuard from '@/pages/OthersProfile/routeGuard'
import MessagePageRouteGuard from '@/pages/Chat/MessagePageRouteGuard'
import TTPlayer from '@/pages/TTPlayer'
import Wallet from '@/pages/Wallet'
import SelectSendToken from '@/pages/Wallet/Send/SelectSendToken'
import SendInputAddress from '@/pages/Wallet/Send/InputAddress'
import SetPage from '@/pages/Wallet/Account/Set'
import ChangePage from '@/pages/Wallet/Account/Change'
import ForgetPage from '@/pages/Wallet/Account/Forget'
import WalletTest from '@/pages/Wallet/Test'
import RecoveryEmail from '@/pages/Wallet/Account/RecoveryEmail'
import Freeze from '@/pages/Wallet/Account/Freeze'
import InputAmount from '@/pages/Wallet/Send/InputAmount'
import ConfirmSendInfo from '@/pages/Wallet/Send/ConfirmSendInfo'
import SendResult from '@/pages/Wallet/Send/SendResult'
import WalletHistory from '@/pages/Wallet/History'
import SelectReceiveToken from '@/pages/Wallet/Receive/SelectReceiveToken'
import TokenReceive from '@/pages/Wallet/Receive/TokenReceive'
import Detail from '@/pages/Wallet/History/Detail'

const Task = lazy(() => import('@/pages/Task'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full pb-10">
    <i className="iconfont icon-loading animate-spin text-[#6254FF]" style={{ fontSize: '40px' }} />
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
      { path: 'jkf-campaign', element: <JKFCampaign /> },
      { path: 'post', element: <NewPost /> },
      { path: 'shares', element: <Shares /> },
      { path: 'test', element: <Test /> },
      { path: 'tt-player', element: <TTPlayer /> },
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
          { path: 'earnings', element: <Earnings /> },
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
      {
        path: 'wallet',
        children: [
          { index: true, element: <Wallet /> },
          { path: 'send/select-token', element: <SelectSendToken /> },
          { path: 'send/input-address', element: <SendInputAddress /> },
          { path: 'send/input-amount', element: <InputAmount /> },
          { path: 'send/confirm-send', element: <ConfirmSendInfo /> },
          { path: 'send/result', element: <SendResult /> },
          { path: 'receive/select-token', element: <SelectReceiveToken /> },
          { path: 'receive/receive/:chain/:address', element: <TokenReceive /> },
          { path: 'history', element: <WalletHistory /> },
          { path: 'history/detail', element: <Detail /> },
        ],
      },
      {
        path: 'account',
        children: [
          { path: 'set', element: <SetPage /> },
          { path: 'change', element: <ChangePage /> },
          { path: 'recovery', element: <RecoveryEmail /> },
          { path: 'test', element: <WalletTest /> },
          { path: 'forget', element: <ForgetPage /> },
          { path: 'freeze', element: <Freeze /> },
        ],
      },
    ],
  },
]
