// import { LoadingSpinner } from '@/components/LoadingSpinner';
// import { getPublicLayout } from '@/components/PublicLayout';
// import { useUserSessionContext } from '@/hooks/userSession';
// import { NextLayoutComponentType } from 'next';
// import { useRouter } from 'next/router';
// import * as React from 'react';

// function Logout() {
// 	const router = useRouter();
// 	const { clear: clearUserSession } = useUserSessionContext();

// 	React.useEffect(() => {
// 		(async () => {
// 			await clearUserSession();
// 			router.replace('/signin');
// 		})();
// 	}, [clearUserSession, router]);

// 	return (
// 		<div className='w-auto h-screen bg-[#00000080] flex justify-center items-center'>
// 			<LoadingSpinner size={60} absoluteCenterPosition={true} />
// 		</div>
// 	);
// }

// (Logout as NextLayoutComponentType).getLayout = getPublicLayout;

// export default Logout;
const Logout = () => <></>;

export default Logout;
