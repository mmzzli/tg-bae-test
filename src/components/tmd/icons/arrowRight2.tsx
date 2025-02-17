import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconArrowRight2 = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 12 12" className={clsx(className)} {...restProps}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.99975 9.49991C4.88675 9.49991 4.77325 9.46191 4.67975 9.38391C4.46775 9.20741 4.43925 8.89191 4.61575 8.67991L6.85375 5.99441L4.69625 3.31341C4.52325 3.09841 4.55725 2.78341 4.77225 2.61041C4.98775 2.43741 5.30225 2.47141 5.47575 2.68641L7.88975 5.68641C8.03875 5.87191 8.03675 6.13691 7.88425 6.31991L5.38425 9.31991C5.28525 9.43841 5.14325 9.49991 4.99975 9.49991Z"
        fill="#121212"
        fill-opacity="0.4"
      />
      <mask
        id="mask0_2393_22684"
        // style="mask-type:luminance"
        maskUnits="userSpaceOnUse"
        x="4"
        y="2"
        width="4"
        height="8"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.99975 9.49991C4.88675 9.49991 4.77325 9.46191 4.67975 9.38391C4.46775 9.20741 4.43925 8.89191 4.61575 8.67991L6.85375 5.99441L4.69625 3.31341C4.52325 3.09841 4.55725 2.78341 4.77225 2.61041C4.98775 2.43741 5.30225 2.47141 5.47575 2.68641L7.88975 5.68641C8.03875 5.87191 8.03675 6.13691 7.88425 6.31991L5.38425 9.31991C5.28525 9.43841 5.14325 9.49991 4.99975 9.49991Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_2393_22684)">
        <rect width="12" height="12" fill="#121212" fill-opacity="0.4" />
      </g>
    </Icon>
  )
}
