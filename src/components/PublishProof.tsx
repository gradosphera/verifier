import { usePublishProof } from "../lib/usePublishProof";
import Button from "./Button";
import { CenteringBox, DataBox, IconBox, TitleText } from "./Common.styled";
import React, { useEffect, useMemo, useState } from "react";
import publish from "../assets/publish.svg";
import verified from "../assets/verified-bold.svg";
import { AppNotification, NotificationType } from "./AppNotification";
import { Box, styled } from "@mui/system";
import { NotificationTitle } from "./CompileOutput";
import { useSubmitSourcesEntries } from "../lib/useSubmitSources";
import { SECTIONS, STEPS, usePublishStore } from "../lib/usePublishSteps";
import { Checkbox, CircularProgress, Fade } from "@mui/material";
import { AppButton } from "./AppButton";
import { VerifierWithId } from "../lib/wrappers/verifier-registry";

const VerifierRow = styled(CenteringBox)({
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  alignItems: "flex-start",
});

const VerifierInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const VerifierStatus = styled("span")({
  fontSize: 12,
  color: "#727272",
});

type PublishProofProps = {
  contractAddress: string;
  missingProofs: VerifierWithId[];
};

export function PublishProof({ contractAddress, missingProofs }: PublishProofProps) {
  const { sendProofs, status, clearTXN } = usePublishProof();
  const { step, toggleSection, currentSection } = usePublishStore();
  const entries = useSubmitSourcesEntries(contractAddress);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  let text: React.ReactNode;

  const onSectionExpand = () =>
    step === STEPS.PUBLISH && missingProofs.length > 0 && toggleSection(SECTIONS.PUBLISH);

  switch (status) {
    case "initial":
      text = (
        <span>
          Чтобы сохранить доказательство верификации вашего контракта в сети, вам нужно выпустить
          транзакцию. Это будет стоить 0.5 TON
        </span>
      );
      break;
    case "rejected":
      text = "Транзакция отклонена, повторите попытку.";
      break;
    case "pending":
      text = "Проверьте ваш кошелёк на наличие ожидающей транзакции.";
      break;
    case "issued":
      text = "Транзакция выпущена, отслеживаем развёртывание доказательства в сети.";
      break;
    case "success":
      text = "Ваш контракт теперь верифицирован! Нажмите ниже, чтобы просмотреть его.";
      break;
    case "expired":
      text = "Срок действия транзакции истёк, повторите попытку.";
      break;
    case "error":
      text =
        "Транзакция выполняется слишком долго или не удалась. Пожалуйста, используйте блокчейн-обозреватель для отслеживания. Вы также можете воспользоваться нашей группой поддержки в Telegram.";
  }

  useEffect(() => {
    setSelected((prev) => {
      const next: Record<string, boolean> = {};
      missingProofs.forEach((verifier) => {
        const ready = !!entries[verifier.name]?.data?.result?.msgCell;
        if (ready) {
          next[verifier.name] = prev[verifier.name] ?? true;
        } else {
          next[verifier.name] = false;
        }
      });
      return next;
    });
  }, [missingProofs, entries]);

  const readySelection = useMemo(
    () =>
      missingProofs.filter(
        (verifier) => selected[verifier.name] && !!entries[verifier.name]?.data?.result?.msgCell,
      ),
    [missingProofs, selected, entries],
  );

  const canPublish = readySelection.length > 0;

  const toggleVerifier = (verifierName: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [verifierName]: checked }));
  };

  const selectAllReady = () => {
    setSelected((prev) => {
      const next = { ...prev };
      missingProofs.forEach((verifier) => {
        const ready = !!entries[verifier.name]?.data?.result?.msgCell;
        next[verifier.name] = ready;
      });
      return next;
    });
  };

  const buildStatus = (verifierName: string) => {
    const entry = entries[verifierName];
    if (!entry) return "Ожидание компиляции";
    if (entry.error) return entry.error.message;
    if (entry.isLoading || entry.status === "pending") {
      return entry.compileStatus ?? "Компиляция...";
    }
    if (entry.data?.result?.msgCell) {
      return entry.compileStatus ?? "Готово к публикации";
    }
    if (entry.compileStatus) {
      return entry.compileStatus;
    }
    if (entry.data) {
      return "Компиляция завершена";
    }
    return "Ожидание компиляции";
  };

  const handlePublish = () => {
    const payloads = readySelection
      .map((verifier) => {
        const msgCell = entries[verifier.name]?.data?.result?.msgCell;
        if (!msgCell) return null;
        return { verifier: verifier.name, msgCell };
      })
      .filter(Boolean) as { verifier: string; msgCell: Buffer }[];

    sendProofs(payloads);
  };

  const disableSelection = ["pending", "issued"].includes(status);

  return (
    <DataBox mb={6}>
      <CenteringBox
        p={currentSection === SECTIONS.PUBLISH ? "30px 24px 0 24px" : "20px 24px"}
        onClick={onSectionExpand}
        sx={{
          opacity: step === STEPS.PUBLISH && missingProofs.length > 0 ? 1 : 0.25,
          cursor: step === STEPS.PUBLISH && missingProofs.length > 0 ? "pointer" : "inherit",
        }}>
        <IconBox>
          <img
            src={status === "success" ? verified : publish}
            alt="publish icon"
            width={41}
            height={41}
          />
        </IconBox>
        <TitleText>Публикация</TitleText>
      </CenteringBox>
      {currentSection === SECTIONS.PUBLISH && missingProofs.length > 0 && (
        <Fade in={currentSection === SECTIONS.PUBLISH}>
          <Box>
            <Box sx={{ padding: "0 30px" }}>
              <AppNotification
                type={NotificationType.INFO}
                title={<></>}
                notificationBody={
                  <CenteringBox sx={{ overflow: "auto", maxHeight: 300 }}>
                    <NotificationTitle sx={{ marginBottom: 0 }}>{text}</NotificationTitle>
                  </CenteringBox>
                }
              />
            </Box>
            <Box sx={{ padding: "10px 30px 0 30px" }}>
              {missingProofs.length === 0 && (
                <VerifierStatus>Все доступные доказательства уже опубликованы.</VerifierStatus>
              )}
              {missingProofs.length > 0 && (
                <>
                  <CenteringBox sx={{ justifyContent: "flex-end", mb: 1 }}>
                    <AppButton
                      fontSize={12}
                      fontWeight={600}
                      textColor="#000"
                      height={30}
                      width={150}
                      background="#fff"
                      hoverBackground="#F5F5F5"
                      onClick={selectAllReady}
                      disabled={disableSelection}>
                      Выбрать все готовые
                    </AppButton>
                  </CenteringBox>
                  {/*NOTE: hide orbs*/}
                  {[...missingProofs].slice(1).map((verifier) => {
                    const ready = !!entries[verifier.name]?.data?.result?.msgCell;
                    return (
                      <VerifierRow key={verifier.id} sx={{ justifyContent: "flex-start" }}>
                        <Checkbox
                          disabled={!ready || disableSelection}
                          checked={!!selected[verifier.name] && ready}
                          onChange={(e) => toggleVerifier(verifier.name, e.target.checked)}
                        />
                        <VerifierInfo>
                          <span style={{ fontWeight: 600 }}>{verifier.name}</span>
                          <VerifierStatus>{buildStatus(verifier.name)}</VerifierStatus>
                        </VerifierInfo>
                      </VerifierRow>
                    );
                  })}
                </>
              )}
            </Box>
            <CenteringBox mb={3} mt={3} sx={{ justifyContent: "center" }}>
              {status !== "success" && (
                <AppButton
                  disabled={status === "pending" || status === "issued" || !canPublish}
                  fontSize={14}
                  fontWeight={800}
                  textColor="#fff"
                  height={44}
                  width={144}
                  background="#1976d2"
                  hoverBackground="#156cc2"
                  onClick={handlePublish}>
                  {(status === "pending" || status === "issued") && (
                    <CircularProgress
                      sx={{ color: "#fff", height: "20px !important", width: "20px !important" }}
                    />
                  )}
                  Опубликовать
                </AppButton>
              )}
              {status === "success" && (
                <Button
                  sx={{ height: 44 }}
                  text="Просмотреть верифицированный контракт"
                  onClick={() => {
                    location.reload();
                  }}
                />
              )}
            </CenteringBox>
          </Box>
        </Fade>
      )}
    </DataBox>
  );
}
