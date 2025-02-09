import devLinksLogoLarge from "../assets/images/logo-devlinks-large.svg";
import emailIcon from "../assets/images/icon-email.svg";
import passwordIcon from "../assets/images/icon-password.svg";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "../schemas/login-schema";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLoginMutation } from "../store/authAPI";
import { ClipLoader } from "react-spinners";

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const [login, { isLoading }] = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data).unwrap();
        } catch (err) {
            console.log("Login failed:", err);
        }
    };

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
                    <form
                        className="flex flex-col mt-[4rem]"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <label
                            className={`${
                                errors.email ? "text-red" : "text-dark-grey"
                            } text-body-small mb-[0.4rem]`}
                            htmlFor="email"
                        >
                            Email address
                        </label>
                        <motion.div
                            animate={{
                                x: errors.email ? [0, -10, 10, -10, 10, 0] : 0, // Shake effect
                            }}
                            transition={{ duration: 0.5 }}
                            className={`border ${
                                errors.email
                                    ? "border-red"
                                    : "border-borders focus-within:border-purple-500 focus-within:shadow-[0_0_32px_0_rgba(99,60,255,0.25)]"
                            } flex gap-[1.2rem] items-center px-[1.6rem] py-[1.2rem] mb-[2.4rem] rounded-[0.8rem] transition-shadow duration-300`}
                        >
                            <img src={emailIcon} alt="Email Icon" />
                            <input
                                className="h-[2.4rem] outline-none w-full text-body-medium text-dark-grey"
                                placeholder="e.g. alex@email.com"
                                type="email"
                                id="email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red text-body-small text-center">
                                    {errors.email.message}
                                </p>
                            )}
                        </motion.div>

                        <label
                            className={`${
                                errors.password ? "text-red" : "text-dark-grey"
                            } text-body-small mb-[0.4rem]`}
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <motion.div
                            animate={{
                                x: errors.password
                                    ? [0, -10, 10, -10, 10, 0]
                                    : 0, // Shake effect
                            }}
                            transition={{ duration: 0.5 }}
                            className={`flex gap-[1.2rem] border ${
                                errors.password
                                    ? "border-red"
                                    : "border-borders focus-within:border-purple-500 focus-within:shadow-[0_0_32px_0_rgba(99,60,255,0.25)]"
                            } items-center px-[1.6rem] py-[1.2rem] mb-[2.4rem] rounded-[0.8rem] transition-shadow duration-300`}
                        >
                            <img src={passwordIcon} alt="Password Icon" />
                            <input
                                className="h-[2.4rem] w-full outline-none text-body-medium text-dark-grey"
                                placeholder="Enter your password"
                                type="password"
                                id="password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-red text-body-small text-center">
                                    {errors.password.message}
                                </p>
                            )}
                        </motion.div>
                        <motion.button
                            whileTap={{
                                scale: 0.95,
                            }}
                            disabled={isLoading}
                            className="bg-purple hover:bg-purple-hover cursor-pointer rounded-[0.8rem] px-[2.7rem] py-[1.1rem] text-[1.6rem] font-semibold leading-[150%] text-white transition-colors duration-300 disabled:bg-[#D3CAF9]"
                            type="submit"
                        >
                            {isLoading ? (
                                <ClipLoader color="#fff" size={18} />
                            ) : (
                                "Login"
                            )}
                        </motion.button>
                    </form>
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
