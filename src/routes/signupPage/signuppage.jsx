import './signuppage.css'
import { SignUp } from '@clerk/clerk-react'

const Signuppage = () => {
  return (
    <div className='signUpPage'>
      <SignUp path="/sign-up" signInUrl='/sign-in'/>
    </div>
  )
}

export default Signuppage