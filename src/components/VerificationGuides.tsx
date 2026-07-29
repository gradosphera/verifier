import React from "react";
import {
  Box,
  CircularProgress,
  Link,
  List,
  ListItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CommandEllipsisLabel, CommandLabel, PopupLink } from "./VerificationProofPopup.styled";
import { downloadJson } from "../utils/jsonUtils";
import { githubLink } from "../const";
import {
  findProofByVerifierName,
  getFirstAvailableProof,
  useLoadContractProof,
} from "../lib/useLoadContractProof";
import { AppButton } from "./AppButton";
import { isOnLocalHost } from "../utils/generalUtils";
import { CenteringBox } from "./Common.styled";
import { NotificationTitle, SuccessTitle } from "./CompileOutput";
import { useInBrowserCompilation, VerificationResults } from "../lib/useInBrowserCompilation";
import { AppNotification, NotificationType } from "./AppNotification";
import like from "../assets/like.svg";
import { useLoadVerifierRegistryInfo } from "../lib/useLoadVerifierRegistryInfo";

export function ManualVerificationGuide() {
  const { data: proofs } = useLoadContractProof();
  const { data: verifierRegistry } = useLoadVerifierRegistryInfo();
  const contractProofData =
    findProofByVerifierName(proofs, verifierRegistry, "verifier.ton.org") ??
    getFirstAvailableProof(proofs);

  return (
    <List sx={{ padding: 0, marginTop: 2 }}>
      <ListItem sx={{ paddingBottom: 0, paddingTop: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
          }}>
          1. Установите{" "}
          <PopupLink target="_blank" href="https://www.docker.com/">
            docker
          </PopupLink>{" "}
          на ваш локальный компьютер
        </Typography>
      </ListItem>
      <ListItem sx={{ paddingTop: "7px", paddingBottom: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: "34px",
            position: "relative",
          }}>
          2. Сохраните этот файл локально как <CommandLabel>sources.json</CommandLabel> :{" "}
          <CommandEllipsisLabel
            onClick={() =>
              !!contractProofData?.ipfsHttpLink && downloadJson(contractProofData.ipfsHttpLink)
            }>
            {contractProofData?.ipfsHttpLink}
          </CommandEllipsisLabel>
        </Typography>
      </ListItem>
      <ListItem sx={{ paddingBottom: "6px", paddingTop: "7px" }}>
        <Typography
          sx={{
            fontSize: 14,
          }}>
          3. Запустите в терминале:{" "}
          <CommandLabel> docker run -i ton-contract-verifier &#60; sources.json </CommandLabel>
        </Typography>
      </ListItem>
      <ListItem>
        <Typography
          sx={{
            fontSize: 14,
          }}>
          4. Просмотрите исходный код Docker-образа здесь:{" "}
          <CommandLabel>
            <PopupLink target="_blank" href={githubLink} sx={{ color: "#212121" }}>
              {githubLink}
            </PopupLink>
          </CommandLabel>
        </Typography>
      </ListItem>
    </List>
  );
}

export function InBrowserVerificationGuide() {
  const { verifyContract, isVerificationEnabled, error, loading, hash } = useInBrowserCompilation();
  const theme = useTheme();
  const notificationsSize = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box p={2}>
      <Typography sx={{ fontSize: 14, marginBottom: 2 }}>
        Вам не обязательно полагаться на сторонних валидаторов. Теперь вы можете верифицировать этот
        контракт самостоятельно, загрузив исходники в браузер и скомпилировав их локально с помощью{" "}
        <Link
          sx={{ textDecoration: "none" }}
          href={"https://github.com/ton-community/func-js"}
          target="_blank">
          WASM
        </Link>
        .
        {!isOnLocalHost() && (
          <CenteringBox mt={1} sx={{ overflow: "auto", maxHeight: 300 }}>
            <NotificationTitle sx={{ margin: 0 }}>
              Веб-страница, которую вы просматриваете, является{" "}
              <Link
                sx={{ textDecoration: "none" }}
                href="https://github.com/ton-community/contract-verifier"
                target="_blank">
                открытым исходным кодом
              </Link>
              , вы также можете форкнуть или запустить её локально, если хотите иметь полный контроль.
            </NotificationTitle>
          </CenteringBox>
        )}
      </Typography>
      {isVerificationEnabled() !== VerificationResults.VALID ? (
        <Tooltip
          arrow
          title={<Typography sx={{ fontSize: 13 }}>{isVerificationEnabled()}</Typography>}
          placement="top">
          <Box sx={{ width: 144, margin: "auto" }}>
            <AppButton
              onClick={() => verifyContract()}
              disabled={isVerificationEnabled() !== VerificationResults.VALID || loading || !!hash}
              fontSize={14}
              fontWeight={800}
              textColor="#fff"
              height={44}
              width={144}
              background="#1976d2"
              hoverBackground="#156cc2">
              Верифицировать локально
            </AppButton>
          </Box>
        </Tooltip>
      ) : (
        <AppButton
          onClick={() => verifyContract()}
          disabled={isVerificationEnabled() !== VerificationResults.VALID || loading || !!hash}
          fontSize={14}
          fontWeight={800}
          textColor="#fff"
          height={44}
          width={144}
          background="#1976d2"
          hoverBackground="#156cc2">
          {loading && (
            <CircularProgress
              sx={{
                color: "#fff",
                height: "20px !important",
                width: "20px !important",
              }}
            />
          )}
          Верифицировать локально
        </AppButton>
      )}
      {error && (
        <>
          <AppNotification
            noBottomMargin
            type={NotificationType.ERROR}
            title={
              <NotificationTitle>
                <span style={{ color: "#FC5656" }}>Ошибка: </span>
                Ошибка компиляции
              </NotificationTitle>
            }
            notificationBody={
              <Box sx={{ overflow: "auto", maxHeight: 300 }}>
                <div>
                  <code>{error}</code>
                </div>
              </Box>
            }
          />
          <Typography sx={{ marginTop: 1, fontSize: 13 }}>
            Вы можете обратиться за помощью в нашу{" "}
            <Link
              sx={{
                textDecoration: "none",
                cursor: "pointer",
                color: "#0088CC",
              }}
              href="https://t.me/tonverifier"
              target="_blank">
              группу поддержки Telegram
            </Link>
          </Typography>
        </>
      )}
      {!!hash && (
        <AppNotification
          noBottomMargin
          singleLine={!notificationsSize}
          type={NotificationType.SUCCESS}
          title={
            <CenteringBox sx={{ height: 42 }}>
              <CenteringBox mr={1}>
                <img src={like} alt="Like icon" width={31} height={31} />
              </CenteringBox>
              <SuccessTitle>
                {" "}
                <b>Отлично!</b> Хеш результата компиляции в браузере совпадает с хешем этого контракта в сети
              </SuccessTitle>
            </CenteringBox>
          }
          notificationBody={<Box />}
        />
      )}
    </Box>
  );
}
