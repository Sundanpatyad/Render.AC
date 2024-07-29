import Footer from "../../common/Footer";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function Template({ title, description1, description2, formType }) {
  return (
    <>
    <div className="relative flex items-center justify-center bg-black">
      <div className="flex flex-col items-center justify-center w-full max-w-xl p-8 md:p-10 lg:p-14  rounded-lg">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
          {/* <p className="text-slate-300 mb-6">
            {description1} <span className="italic text-slate-400">{description2}</span>
          </p> */}
        </div>
        <div className="w-full">
          {formType === "signup" ? (
            <SignupForm />
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
      <Footer/>
      </>
  );
}

export default Template;
