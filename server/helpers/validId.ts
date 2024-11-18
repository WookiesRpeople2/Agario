export const validId = async <T>(
  onSuccess: () => void,
  onFailure: (error: string) => void
) => {
  try {
    onSuccess();
  } catch (error) {
    onFailure(error as string);
  }
};
