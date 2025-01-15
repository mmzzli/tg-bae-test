import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import {
  Input
} from '@chakra-ui/react'

const Trailer = ()=>{
  const inputRef = useRef<HTMLInputElement | null>(null)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

  }

  const handleChooseFile = ()=>{
    inputRef.current?.click()
  }

  return (
    <>
      <p className='h-[64px] w-[64px] bg-[#F7F9FC] rounded-md flex-none'
        onClick={handleChooseFile}
      ></p>
      <Input
        type="file"
        accept=".mp4,.webm"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={inputRef}
      />
    </>
  )
}
export default Trailer
