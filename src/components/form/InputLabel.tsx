import { Fragment } from 'react/jsx-runtime';

export default function InputLabel({ label }: { label?: string; }) {
    return (
        <Fragment>
            {label && (
                <label className='block pb-1 ml-1 text-md font-bold color-label'>
                    {label}
                </label>
            )}
        </Fragment>
    );
}
