import { theme } from "@chakra-ui/react"

export enum typeOptions {
  success='success',
  error="error",
  warning="warning",
  info="info"
}
export const IconMap = {
  [typeOptions.success]:{
    icon:'icon-checkbox-circle-fill',
    color:'#2CC069',
    background:"#202623"
  },
  [typeOptions.error]:{
    icon:"icon-close-circle-fill",
    color:'#E94242',
    background:"#262120"
  },
  [typeOptions.warning]:{
    icon:'icon-icon_warn',
    color:"#FF7C3F",
    background:"#1F1D1B"

  },
  [typeOptions.info]:{
    icon:"icon-icon_info",
    color:'#097AFE',
    background:"#1F1D1B"
  }
}
interface ToastProps{
  title:string,
  type:typeOptions
}

export const ToastBeforeIcon:React.FC<{type:typeOptions}> = ({type})=>{
  const theme = IconMap[type]
  return (
    <i className={`mr-[3px] iconfont ${theme.icon} text-[20px] `} style={{color:theme.color}}></i>
  )
}

export const CustomToast:React.FC<ToastProps> = ({title,type}) =>{
  const theme = IconMap[type]
  return <div className={`rounded-lg p-2.5 justify-center items-center gap-1`} style={{background: theme.background}}>
    {
      <ToastBeforeIcon type={type}></ToastBeforeIcon>
    }
    <span className="text-[var(--Dark-T1)] relative top-[-2px]">{title}</span>
  </div>
}
