import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import { Link } from "react-router-dom";
import devLinksLogoLarge from "../assets/images/logo-devlinks-large.svg";

const Login = () => {
    return (
        <main className="bg-light-grey sm:bg-white sm:p-[3.2rem] w-screen h-screen flex justify-center items-center sm:items-start">
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="max-w-[47.6rem] w-full"
            >
                <img
                    className="mx-auto sm:mx-0"
                    src={devLinksLogoLarge}
                    alt="Dev Links Logo"
                />
                <div className="mt-[5.1rem] sm:mt-[6.4rem] p-[4rem] sm:p-0 bg-white rounded-[1.2rem]">
                    <h1 className="text-[3.2rem] font-bold leading-[150%] sm:text-[2.4rem] text-dark-grey">
                        Login
                    </h1>
                    <p className="text-grey text-body-medium mt-[0.8rem]">
                        Add your details below to get back into the app
                    </p>
                    <LoginForm />

                    <p className="text-body-medium text-grey mt-[2.4rem] text-center">
                        Don't have an account?{" "}
                        <br className="hidden sm:block" />
                        <Link className="text-purple" to="/register">
                            Create account
                        </Link>
                    </p>
                </div>
            </motion.section>
        </main>
    );
};

export default Login;
