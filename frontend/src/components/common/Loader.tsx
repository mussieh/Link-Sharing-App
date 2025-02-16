import { GridLoader } from "react-spinners";

const Loader = () => {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <GridLoader color="#623CFF" />
        </div>
    );
};

export default Loader;
