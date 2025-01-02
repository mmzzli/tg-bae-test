import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { retrieveLaunchParams } from '@tma.js/sdk'
import { getSingleMedia } from '@/api/list'
import Icon from '@/components/comm/Icon'
import { useSafeState } from 'ahooks'
import { useRecommendList } from '@/store/hook/useResourceList'
import { CacheVideo, FormatterListItem } from '@/store/slices/resourceListSlice'
import { useBoolean, useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

const SHARE_POST = 1
const SHARE_PROFILE = 2

const Splash: FC = () => {
  const navigate = useNavigate()
  const userInfo = useStore((state) => state.userInfo)
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  const loadVideo = useStore((state) => state.loadVideo)
  const toast = useToast()

  const setBackToHome = useStore((state) => state.setBackToHome)
  const { token, setSharedPostList, setOthersUserInfo } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
    setOthersUserInfo: state.setOthersUserInfo,
    token: state.token,
  }))
  const [animationEnding, setAnimationEnding] = useSafeState(false)
  const { list } = useRecommendList()
  const [isCached, setIsCached] = useState(false)

  const { isInTMA, getCurrentUid } = useTMAUtils()
  const { startParam } = retrieveLaunchParams()
  const current_uid = getCurrentUid()

  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      const ageGateBoll = localStorage.getItem(`ageGate-${current_uid}`)
      if (ageGateBoll) {
        navigate('/home')
      } else {
        navigate('/ageGate')
      }
    }, 10000)

    if (list && list.length > 0) {
      const resources = list.filter((item) => item.type === 0)

      if (resources.length) {
        setCacheVideoIndex(resources[0].id)
        updateCacheVideo(resources, true)
      }
    }
    const cacheTimer = setTimeout(() => {
      setIsCached(true)
    }, 2000)

    return () => {
      clearTimeout(timeoutTimer)
      clearTimeout(cacheTimer)
    }
  }, [list])

  useEffect(() => {
    if (userInfo.user_id && token && isCached) {
      const ageGateBoll = localStorage.getItem(`ageGate-${current_uid}`)
      if (!isInTMA || !startParam || history.length > 2) {
        if (ageGateBoll) {
          return navigate('/home')
        } else {
          return navigate('/ageGate')
        }
      }
      const params = startParam.split('_')
      console.log('startParam', params)

      let sharedRef = ''
      const isShare = params.some((p) => {
        const pairs = p.split('=')
        if (pairs[0] === 'ref' && pairs[1]) {
          sharedRef = pairs[1]
          return true
        }
        return false
      })
      if (isShare) {
        setBackToHome(true)
        handleNavigate(sharedRef)
      } else {
        if (ageGateBoll) {
          navigate('/home')
        } else {
          navigate('/ageGate')
        }
      }
    }
  }, [userInfo, animationEnding, isCached])

  const handleNavigate = async (ref: string) => {
    console.log('token ready, navigating...')
    const ageGateBoll = localStorage.getItem(`ageGate-${current_uid}`)
    if (!token) return
    try {
      const data = await getSingleMedia(ref)
      console.log('getSingleMedia', data)
      if (data.type === SHARE_POST) {
        setSharedPostList(data.media)
        if(ageGateBoll){
          navigate(`/shares?ref=${ref}`)
        }else{
          navigate(`/ageGate?ref=${ref}`)
        }
      } else if (data.type === SHARE_PROFILE) {
        setOthersUserInfo({ ...data.userInfo, uid: data.userInfo.user_id })
        navigate(`/profile/${data.userInfo.uid || data.userInfo.user_id}`)
      }
    } catch (error) {
      toast({
        render: () => {
          return <CustomToast title="This content has been deleted by the creator and cannot be accessed." type={typeOptions.warning} />
        },
        position: 'top',
      })
      navigate(`/home`)
      console.warn('API ERROR', error)
    }
  }

  useEffect(() => {
    if (!isInTMA || !startParam || history.length > 2) return
    const params = startParam.split('_')
    console.log('startParam', params)

    params.forEach((p) => {
      const pairs = p.split('=')
      if (pairs[0] === 'ref' && pairs[1]) {
        handleNavigate(pairs[1])
      }
    })
  }, [startParam, isInTMA])

  const isProd = import.meta.env.MODE === 'production'
  if (!isProd) {
    return null
  }
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 dark:bg-[#0D0D0D] bg-white flex justify-center items-center z-10 flex-col">
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="1124.000000pt"
          height="2436.000000pt"
          viewBox="0 0 1124.000000 2436.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0.000000,2436.000000) scale(0.100000,-0.100000)"
            fill="#6661ff"
            stroke="none"
          >
            <path
              d="M2807 24353 c1547 -2 4079 -2 5625 0 1547 1 282 2 -2812 2 -3094 0
              -4359 -1 -2813 -2z"
            />
            <path
              d="M2972 15400 c-122 -13 -184 -27 -317 -72 -139 -47 -303 -132 -430
                -223 -153 -109 -353 -309 -480 -480 -166 -223 -311 -536 -389 -841 -30 -118
                -75 -392 -86 -518 -13 -165 -13 -531 0 -711 10 -134 66 -523 96 -670 25 -126
                101 -428 139 -555 37 -126 122 -381 129 -388 2 -2 18 4 36 13 29 15 94 41 355
                142 50 19 93 38 97 42 5 4 -15 74 -42 156 -294 874 -365 1783 -189 2409 85
                298 212 533 401 742 100 110 149 154 248 225 206 147 459 224 660 198 295 -37
                528 -221 585 -461 19 -83 19 -232 -1 -321 -19 -81 -58 -177 -73 -177 -5 0 -58
                17 -118 39 -59 21 -171 51 -248 67 -122 25 -161 29 -300 28 -140 0 -172 -4
                -260 -27 -244 -66 -465 -218 -589 -407 -60 -92 -72 -117 -101 -215 -58 -202
                -11 -393 134 -535 95 -93 207 -145 378 -175 367 -64 839 112 1192 444 36 34
                67 61 71 61 8 0 68 -64 112 -120 50 -63 115 -198 135 -278 33 -135 19 -390
                -30 -522 -30 -84 -29 -84 -110 -40 -321 171 -672 190 -1054 59 -289 -100 -470
                -236 -563 -423 -77 -158 -76 -307 5 -472 37 -77 58 -104 124 -166 173 -163
                403 -233 678 -207 240 22 621 191 925 408 46 34 47 34 71 15 13 -11 60 -47
                103 -80 154 -119 260 -175 404 -214 113 -30 257 -25 375 13 87 29 223 107 269
                156 17 17 35 31 40 31 6 0 25 -19 41 -42 75 -103 249 -211 390 -241 125 -27
                168 -29 263 -13 192 33 327 95 469 215 l72 61 73 -56 c203 -157 404 -237 593
                -237 55 0 120 5 145 12 196 55 357 171 460 335 19 30 39 55 43 56 5 0 42 -30
                82 -68 198 -181 518 -295 875 -309 230 -8 404 19 610 98 379 145 697 440 970
                899 39 64 70 121 70 127 0 8 -448 253 -463 253 -2 0 -36 -53 -75 -117 -374
                -625 -848 -852 -1407 -673 -117 38 -197 86 -262 158 -57 62 -150 229 -135 244
                5 5 112 35 238 68 371 95 729 222 967 342 232 116 437 278 540 425 52 75 73
                121 102 220 98 333 -82 633 -431 722 -45 11 -136 26 -202 33 -348 35 -835 -84
                -1137 -277 -263 -167 -492 -464 -594 -770 -59 -175 -75 -285 -73 -500 1 -200
                -14 -299 -69 -449 -54 -149 -147 -275 -214 -292 -43 -11 -113 4 -173 36 -72
                38 -212 141 -212 156 0 6 44 103 98 215 55 112 109 231 122 264 13 33 27 65
                30 70 19 25 140 377 150 435 25 139 9 323 -39 450 -71 188 -251 373 -434 447
                -115 47 -221 66 -342 60 -441 -20 -841 -317 -1072 -797 -107 -222 -195 -515
                -227 -764 -12 -92 -20 -116 -62 -196 -85 -161 -198 -276 -284 -287 -53 -7
                -140 34 -255 122 -49 38 -93 73 -96 78 -4 5 13 51 37 103 83 177 122 343 130
                559 17 405 -114 743 -394 1021 l-93 92 29 58 c87 174 126 343 126 554 0 213
                -25 325 -114 505 -99 200 -258 367 -463 487 -90 52 -259 116 -368 138 -105 22
                -306 31 -417 20z m219 -1896 c124 -23 159 -33 159 -48 0 -39 -293 -199 -425
                -231 -129 -32 -315 -18 -315 24 0 10 14 39 31 64 59 90 156 154 281 187 90 23
                161 25 269 4z m6170 -173 c31 -5 75 -15 98 -21 36 -10 41 -14 41 -41 0 -44
                -21 -77 -87 -140 -174 -166 -515 -319 -1032 -464 -208 -59 -231 -63 -231 -41
                0 24 43 120 94 205 61 105 221 268 316 324 219 127 598 211 801 178z m-2728
                -178 c63 -32 97 -66 128 -128 53 -108 44 -162 -81 -470 -211 -524 -430 -862
                -614 -949 -89 -42 -180 -34 -239 22 -124 117 -140 394 -41 739 129 451 369
                739 669 803 53 12 139 4 178 -17z m-3139 -1318 c111 -19 163 -40 147 -58 -27
                -34 -353 -186 -456 -213 -117 -32 -292 -6 -330 49 -14 20 -13 23 16 53 63 65
                240 136 424 169 93 17 99 17 199 0z"
            />
            <path
              d="M0 10 c0 -7 1880 -10 5620 -10 3740 0 5620 3 5620 10 0 7 -1880 10
-5620 10 -3740 0 -5620 -3 -5620 -10z"
            />
          </g>
        </svg>
    </div>
  )
}

export default Splash
