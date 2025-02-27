export interface TooltipConfig {
  enableCopy?: boolean
  enableReply?: boolean
  enableRevoke?: boolean
  enableDownload?: boolean
}

export const defaultTooltipConfig: TooltipConfig = {
  enableCopy: true,
  enableReply: true,
  enableRevoke: true,
  enableDownload: true,
}
