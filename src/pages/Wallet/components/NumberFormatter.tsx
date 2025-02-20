interface NumberFormatterProps {
  value: number | string | undefined
  prefix?: string
  suffix?: string
  separator?: boolean
  fixNum?: number // number >= 1 fix num
  tFixNum?: number // number < 1 fix num
  intClassName?: string
  decimalClassName?: string
}

function getZeroCount(num: number) {
  const [intPart, decimalPart] = num.toString().split('.')
  if (!decimalPart) {
    return 0
  }
  let zeroCount = 0
  for (let i = 0; i < decimalPart.toString().length; i++) {
    if (decimalPart.toString()[i] === '0') {
      zeroCount++
    } else {
      break
    }
  }
  return zeroCount
}

function convertScientificToDecimal(num: number | string) {
  let str = typeof num === 'number' ? num.toFixed(12) : num

  if (isNaN(Number(str))) str = (0).toFixed(12)

  if (Number(str) < 1) {
    str = str.replace(/0+$/, '')
    str = str.replace(/\.$/, '')
  }
  return str
}

export const NumberFormatter: React.FC<NumberFormatterProps> = ({
  value,
  prefix = '',
  suffix = '',
  separator = true,
  fixNum = 2,
  tFixNum = 4,
  intClassName,
  decimalClassName
}) => {
  const BASE_NUMS = 4
  const numberValue =
    typeof value === 'number' || typeof value === 'string'
      ? convertScientificToDecimal(Number(value))
      : '0'

  const [intPart, decimalPart] = numberValue.toString().split('.')
  const match = decimalPart ? decimalPart.match(/^0+/) : undefined
  const subLen = match ? match[0].length : 0
  const remaining = decimalPart ? decimalPart.slice(subLen) : ''
  const intFormat = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : intPart

  if (Math.abs(parseFloat(numberValue)) >= 1) {
    if (subLen >= BASE_NUMS) {
      return (
        <span>
          {prefix}
          <span className={intClassName}>{intFormat}</span>
          {remaining ? (
            <span className={decimalClassName}>
              .
              {subLen ? (
                <span>
                  0<sub>{subLen}</sub>
                  {remaining.substring(0, 4)}
                </span>
              ) : (
                <span>{(decimalPart || '').substring(0, fixNum)}</span>
              )}
            </span>
          ) : (
            ''
          )}
          {suffix}
        </span>
      )
    }
    return (
      <span>
        {prefix}
        <span className={intClassName}>{intFormat}</span>
        {decimalPart ? (
          <span className={decimalClassName}>
            .{decimalPart.substring(0, fixNum)}
          </span>
        ) : (
          ''
        )}
        {suffix}
      </span>
    )
  }

  if (decimalPart) {
    let zeroCount = 0
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === '0') {
        zeroCount++
      } else {
        break
      }
    }
    if (zeroCount < tFixNum) {
      if (subLen >= BASE_NUMS) {
        return (
          <span>
            {prefix}
            <span className={intClassName}>{intFormat}</span>
            <span className={decimalClassName}>
              .
              {subLen ? (
                <span>
                  0<sub>{subLen}</sub>
                  {remaining.substring(0, 4)}
                </span>
              ) : (
                <span>{(decimalPart || '').substring(0, fixNum)}</span>
              )}
            </span>
            {suffix}
          </span>
        )
      }
      return (
        <span>
          {prefix}
          <span className={intClassName}>{intFormat}</span>
          <span className={decimalClassName}>
            .{decimalPart.substring(0, tFixNum)}
          </span>
          {suffix}
        </span>
      )
    }
    return (
      <span>
        {prefix}
        <span className={intClassName}>{intFormat}</span>
        <span className={decimalClassName}>
          .0<sub>{zeroCount}</sub>
          {decimalPart?.substring(zeroCount, zeroCount + tFixNum - 2)}
        </span>
        {suffix}
      </span>
    )
  }
  return (
    <span>
      {prefix}
      <span className={intClassName}>{intPart}</span>
      {suffix}
    </span>
  )
}

type UsdFormatterProps = Omit<NumberFormatterProps, 'prefix'> & {
  value: number
}

export const UsdFormatter: React.FC<UsdFormatterProps> = (props) => {
  return <NumberFormatter {...props} prefix={'$'} />
}
