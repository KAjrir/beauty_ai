'use client'

import AuthForm from "@/components/AuthForm"
import { signUpSchema } from "@/lib/validations";
import { signUp } from "@/lib/actions/action";

const page = () => {
  return (
    <AuthForm
      type="SIGN_UP"
      schema={signUpSchema} 
      defaultValues={{
        email: "",
        password: ""
      }}
      onSubmit={signUp}
    />
  )
}

export default page