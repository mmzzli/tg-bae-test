import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react';
import { useBoolean, Text } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'

import BaseButton from '@/components/BaseButton/BaseButton'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useStore } from '@/store'


interface Frame {
  url: string;
  time: number;
}
interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  setCover: Dispatch<SetStateAction<string | null>>;
}

const VideoFrameSelector: React.FC<VideoPlayerProps> = ({ videoRef, setCover }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const token = useStore((state) => state.token)

  const extractFramesFromVideo = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    console.log(videoRef)
    console.log(video)

    const framesArray: Frame[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth / 4;
    canvas.height = video.videoHeight / 4;

    const videoDuration = video.duration;

    const frameInterval = videoDuration / 20;

    video.currentTime = 0;

    const extractFrame = () => {
      if (video.currentTime >= videoDuration) {
        video.ontimeupdate = null;
        return;
      }

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        framesArray.push({
          url: canvas.toDataURL('image/png'),
          time: video.currentTime,
        });
        setFrames([...framesArray]);
      }

      video.currentTime += frameInterval;
    };

    video.ontimeupdate = extractFrame;

    video.play();
  };

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
  };
  useEffect(()=>{
    if(isBaseModalOpen){
      extractFramesFromVideo()
    }
  },[videoRef, isBaseModalOpen])
  useEffect(()=>{
    if(frames.length === 1){
      setSelectedFrame(frames[0]);
    }
  },[frames])



  function base64ToFile(base64String:any, filename:string) {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }


  return (
    <>
      <Text color="#FFF" fontSize="14px" borderRadius="4px" bg="rgba(0, 0, 0, 0.50)" p="5px 9px 6px 10px"
        position="absolute"
        bottom="8px"
        right="8px"
        cursor="pointer"
        onClick={()=>toggle()}
      >
        Select cover
      </Text>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="80vh"
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className='w-[100%]'>
          <h2 className='text-[24px] text-[#E0E2F6] mt-[24px]'>Select cover</h2>
          <div className='rounded-[5px] mt-[16px] overflow-hidden'>
            {selectedFrame &&
              <img className='h-[184px] object-cover' src={selectedFrame.url} alt={`Selected Frame at ${selectedFrame.time}s`} width="100%" />
            }
          </div>
          <div className='bg-[#1C1C1C] rounded-tl-[16px] rounded-tr-[16px]'>
            <div className='px-[16px]'>
              <p className='text-center text-[#808080] pt-[62px] pb-[15px]'>Swipe left and right to choose the best cover</p>
              <div className='flex overflow-auto rounded-[8px]'>
                {frames.map((frame, index) => (
                  <img
                    key={index}
                    src={frame.url}
                    alt={`Frame at ${frame.time}s`}
                    onClick={() => handleSelectFrame(frame)}
                    className='object-cover'
                    style={{
                      height: '64px',
                      width: '48px',
                      minWidth: '48px',
                      cursor: 'pointer',
                      border: selectedFrame?.time === frame.time ? '2px solid #FFF' : 'none',
                    }}
                    width="100px"
                  />
                ))}
              </div>
              <div className='px-[26px] pt-[24px] pb-[44px]'>
                <BaseButton
                  text="Done"
                  width="100%"
                  className='h-[48px]'
                  handler={async()=>{
                    const timestamp: number = new Date().getTime();
                    const url = `https://picupload.mobus.workers.dev/upload/${timestamp}`
                    const file = base64ToFile(selectedFrame?.url, "image.png");

                    const formData = new FormData()
                    formData.append('file', file)
                    try {
                      const response = await axios.put(url, formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          Authorization: `Bearer ${token}`,
                        },
                      })
                      setCover(response.data)
                      off()
                    } catch (error) {
                      console.error(`Error uploading ${file.name}:`, error)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default VideoFrameSelector;
