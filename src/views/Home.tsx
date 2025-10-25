import { useEffect, useState } from 'react';
import CircularProgress from '../components/CircularProgress';

export default function Home() {
    const [value, setValue] = useState(20);
    const min = 20;
    const max = 80;

    useEffect(() => {
        let isMounted = true;

        async function animate() {
            for (let i = min; i <= max; i++) {
                if (!isMounted) break;
                setValue(i);
                await new Promise((res) => setTimeout(res, 30));
            }
        }

        animate();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className='container-cols'>
            <div className="color-container p-cnt rounded-lg shadow-lg">
                <p className="mb-6">
                    Sapa UMKM adalah sebuah platform digital atau super app yang dikembangkan oleh Kementerian Koperasi dan UKM (Usaha Mikro, Kecil, dan Menengah) untuk menjadi pusat informasi dan layanan terpadu bagi pelaku UMKM di seluruh Indonesia. Platform ini bertujuan untuk mempermudah akses pelaku UMKM terhadap berbagai layanan seperti pembiayaan, pelatihan, pemasaran, dan konsultasi, serta menghubungkan mereka dengan berbagai program pemerintah dan pihak terkait lainnya.
                </p>
                <CircularProgress progress={value} min={min} max={max} />
            </div>
        </div>
    );
}
