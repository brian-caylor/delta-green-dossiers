import { useState } from "react";

export function useModals() {
  const [kiaConfirmOpen, setKiaConfirmOpen] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [clearLogOpen, setClearLogOpen] = useState(false);
  const [sessionReport, setSessionReport] = useState(null);
  const [sanProjectionOpen, setSanProjectionOpen] = useState(false);
  const [sanEventOpen, setSanEventOpen] = useState(false);
  const [sanEventData, setSanEventData] = useState(null);
  const [importChoiceOpen, setImportChoiceOpen] = useState(false);
  const [gearCatalogOpen, setGearCatalogOpen] = useState(false);

  return {
    kiaConfirmOpen, setKiaConfirmOpen,
    confirmDialog, setConfirmDialog,
    clearLogOpen, setClearLogOpen,
    sessionReport, setSessionReport,
    sanProjectionOpen, setSanProjectionOpen,
    sanEventOpen, setSanEventOpen,
    sanEventData, setSanEventData,
    importChoiceOpen, setImportChoiceOpen,
    gearCatalogOpen, setGearCatalogOpen,
  };
}
