import Container from '@/components/Container'
import useLoginInfo from '@/hooks/useLoginInfo'

const EmailCurrent = () => {
  const { user } = useLoginInfo()
  return (
    <>
      <Container className="!px-[20px] !pt-0">
        <div className="flex h-[48px] w-full items-center py-[4px]">
          <h3 className="text-h3 font-semibold text-t1">Current Email</h3>
        </div>
        <p className="w-full text-lg text-t3">{user?.email}</p>
      </Container>
    </>
  )
}

export default EmailCurrent
