import { SkeletonTheme } from "react-loading-skeleton";

export default function LoadingIndicatorContainer({children}) {
    return (
        <SkeletonTheme baseColor="#cfcfcf" highlightColor="#ebebeb">
            {children}
        </SkeletonTheme>
    );
}