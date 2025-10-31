import { Fragment } from "react/jsx-runtime";

export default function ErrorForm({ text }: { text?: string }) {
    return (
        <Fragment>
            {text && (
                <small className="mt-1 mx-1 block text-xs text-light-error-base dark:text-dark-error-base">{text}</small>
            )}
        </Fragment>
    );
}
