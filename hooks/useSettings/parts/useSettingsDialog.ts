import { useAlertDialog } from '../../useAlertDialog';

export const useSettingsDialog = () => {
  const { 
    alertDialog, 
    setAlertDialog, 
    showAlertDialog: showDialog, 
    closeAlertDialog: closeDialog 
  } = useAlertDialog();

  return {
    alertDialog,
    setAlertDialog,
    showDialog,
    closeDialog
  };
};
