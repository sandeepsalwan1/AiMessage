import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return ( 
    <div className="flex min-h-full flex-col justify-center py-6 sm:px-6 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <Image alt="logo" src="/images/logo.png" width={200} height={200} className="w-auto" style={{ marginBottom: '-100px' }} />
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        </div>
      </div>
      <AuthForm />
    </div>
  );
}
