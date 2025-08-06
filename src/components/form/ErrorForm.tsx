export default function ErrorForm({ text }: { text: string }) {
    return (
        <small className="mt-1 mx-1 block text-xs text-light-error-base dark:text-dark-error-base">{text}</small>
    );
}
