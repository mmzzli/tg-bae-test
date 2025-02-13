// import useCommonStore from '@/stores/commonStore/hooks/useCommonStore'
// import { observer } from 'mobx-react-lite'
// import React, { useState } from 'react'
// import { Loading } from './Loading'
// import { TButton, TIcon } from './tmd'
// import AdaptiveNumber, { NumberType } from './AdaptiveNumber'
// import { UsdFormatter } from './NumberFormatter'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { formatUnits } from 'viem'
// import classNames from 'classnames'
// import IText from './IText'
// import { IWeb3ChainType } from '@/proviers/web3Provider/type'
// import commonStore from '@/stores/commonStore'
// import chains from '@/proviers/web3Provider/chains'

/**
 * Enum representing different fee modes for gas fees.
 */
export enum FeeMode {
  FAST = 'Instant', // Represents the fastest gas fee.
  SLOW = 'Average', // Represents the slowest gas fee.
  AVERAGE = 'Fast' // Represents the average gas fee.
}

export const evmFeeConfig: {
  [key in FeeMode]: number
} = {
  [FeeMode.FAST]: 1.5,
  [FeeMode.SLOW]: 1,
  [FeeMode.AVERAGE]: 1.2
}

// export const getEvmFeeConfig = ({
//   chain,
//   type = 'Swap'
// }: {
//   chain: IWeb3ChainType | undefined
//   type?: 'Swap' | 'Send'
// }) => {
//   if (!chain) return
//   if (chain.id === chains.ethereum.id) {
//     if (type === 'Send') {
//       return {
//         [FeeMode.SLOW]: 1,
//         [FeeMode.AVERAGE]: 1.5,
//         [FeeMode.FAST]: 1.875
//       }
//     } else {
//       return {
//         [FeeMode.SLOW]: 1.2,
//         [FeeMode.AVERAGE]: 1.7,
//         [FeeMode.FAST]: 2.2
//       }
//     }
//   }
//   return {
//     [FeeMode.SLOW]: 1.25,
//     [FeeMode.AVERAGE]: 1.5,
//     [FeeMode.FAST]: 1.875
//   }
// }

// export const FEECONFIG: {
//   [key in FeeMode]: {
//     time: string
//     icon: string
//     color: string
//     index: number
//   }
// } = {
//   [FeeMode.SLOW]: {
//     time: '5 min',
//     icon: 'slow',
//     color: 'text-yellow',
//     index: 0
//   },
//   [FeeMode.AVERAGE]: {
//     time: '3 min',
//     icon: 'average',
//     color: 'text-green',
//     index: 1
//   },
//   [FeeMode.FAST]: {
//     time: '1 min',
//     icon: 'fast',
//     color: 'text-blue',
//     index: 2
//   }
// }

// export type ModeFeesType = { [key in FeeMode]: number }

// const FeeSelectItem = observer(
//   ({
//     mode,
//     value,
//     current,
//     setRenderFeeMode
//   }: {
//     mode: FeeMode
//     value: React.ReactNode
//     current: boolean
//     setRenderFeeMode: React.Dispatch<React.SetStateAction<FeeMode>>
//   }) => {
//     return (
//       <div
//         className={classNames(
//           'h-[80px] flex items-center justify-between px-4 py-5 w-full border rounded-lg',
//           {
//             ' border-t1 ': current,
//             ' border-l1 ': !current
//           }
//         )}
//         onClick={() => {
//           setRenderFeeMode(mode)
//         }}
//       >
//         <div className="flex items-center gap-4 text-base font-medium text-t1">
//           <TIcon
//             name={FEECONFIG[mode].icon}
//             fontSize="24"
//             className={FEECONFIG[mode].color}
//           />
//           {mode}
//         </div>
//         <div className="flex flex-col items-end gap-1">
//           <div className="text-base font-medium text-t1">
//             {FEECONFIG[mode].time}
//           </div>
//           {value}
//         </div>
//       </div>
//     )
//   }
// )

// const FeeSelect = ({
//   nativeToken,
//   modeFees,
//   onClose,
//   chain,
//   fees
// }: {
//   nativeToken: AssetsToken | undefined
//   modeFees: ModeFeesType | undefined
//   onClose: () => void
//   chain: IWeb3ChainType | undefined
//   fees?:
//     | {
//         [key in FeeMode]?: {
//           fee: string
//           formatted: string
//           formattedUsd: string
//         }
//       }
//     | undefined
// }) => {
//   const { setFeeMode } = useCommonStore()
//   const feeMode = commonStore.feeMode
//   // const setFeeMode = commonStore.setFeeMode
//   const [renderFeeMode, setRenderFeeMode] = useState(feeMode)

//   if (!modeFees) {
//     return (
//       <div className="flex size-full items-center justify-center">
//         <Loading />
//       </div>
//     )
//   }

//   const arr = Object.entries(modeFees).sort((a, b) => {
//     const aIndex = FEECONFIG[a[0] as FeeMode].index
//     const bIndex = FEECONFIG[b[0] as FeeMode].index

//     return aIndex - bIndex
//   })

//   return (
//     <div className="flex size-full flex-col justify-between">
//       <div className="flex flex-col items-center gap-2">
//         {arr.map((item, index) => {
//           const priorityFee = item[1]
//           const current = renderFeeMode === item[0]

//           const format = (() => {
//             if (chain?.type === 'EVM') {
//               return priorityFee
//             } else {
//               return priorityFee
//             }
//           })()

//           const formattedUsd = fees && fees[item[0] as FeeMode]?.formattedUsd

//           return (
//             <FeeSelectItem
//               mode={item[0] as FeeMode}
//               current={current}
//               setRenderFeeMode={setRenderFeeMode}
//               value={
//                 <div className={`flex text-t3`}>
//                   <AdaptiveNumber
//                     value={format || 0}
//                     type={NumberType.BALANCE}
//                     // decimalSubLen={nativeToken?.decimals}
//                     decimalSubLen={6}
//                     decimalFlag
//                   />
//                   &nbsp;{nativeToken?.symbol || '-'}
//                   {formattedUsd ? (
//                     <UsdFormatter value={Number(formattedUsd)} />
//                   ) : (
//                     <>
//                       ((
//                       {nativeToken?.price && priorityFee ? (
//                         <UsdFormatter
//                           value={Number(Number(format) * nativeToken.price)}
//                         />
//                       ) : (
//                         '0$'
//                       )}
//                       ))
//                     </>
//                   )}
//                 </div>
//               }
//               key={index}
//             />
//           )
//         })}
//       </div>
//       <TButton
//         onClick={() => {
//           setFeeMode(renderFeeMode)
//           onClose()
//         }}
//         size={`large`}
//         block
//       >
//         <IText value="tg_wallet_swap.continue" />
//       </TButton>
//     </div>
//   )
// }

// export default FeeSelect
