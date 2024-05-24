// import apiClient from '@/api';
// import { useMutation } from '@tanstack/react-query';

// export function useLogoutMutation({
// 	onError,
// 	onSuccess,
// }: {
// 	onError?: (error: Error) => void;
// 	onSuccess?: () => void;
// } = {}) {
// 	return useMutation({
// 		mutationFn: async () => {
// 			const res = await apiClient.post<void>('/auth/logout');
// 			return res.data;
// 		},
// 		onError,
// 		onSuccess,
// 	});
// }

export {};
