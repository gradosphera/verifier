import { styled } from "@mui/system";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import alert from "../assets/verification-alert.svg";
import binary from "../assets/verification-binary.svg";
import bomb from "../assets/verification-bomb.svg";
import paper from "../assets/verification-paper.svg";
import verification from "../assets/verification.svg";
import { CenteringWrapper } from "./Footer.styled";
import { CenteringBox, DataBox, IconBox, TitleBox, TitleText } from "./Common.styled";

interface VerificationRulesProps {
  makeFlexible?: boolean;
}

const VerificationRules = styled(CenteringBox, {
  shouldForwardProp: (prop) => prop !== "makeFlexible",
})<VerificationRulesProps>(({ theme, makeFlexible }) => ({
  flexWrap: makeFlexible ? "wrap" : "inherit",
  gap: makeFlexible ? 20 : "inherit",
  justifyContent: makeFlexible ? "center" : "space-between",
  padding: 24,
  [theme.breakpoints.down("lg")]: {
    width: "70%",
    margin: "auto",
  },
}));

const VerificationRule = styled(CenteringWrapper)({
  boxSizing: "border-box",
  display: "flex",
  minWidth: 180,
  maxWidth: 255,
  height: 108,
  background: "#F7F9FB",
  borderRadius: 14,
  padding: "28px 13px",
});

const VerificationRuleDescription = styled(Typography)({
  fontSize: 14,
  color: "#000",
});

interface Rule {
  icon: string;
  description: string;
}

const verificationRules: Rule[] = [
  {
    icon: paper,
    description: "Этот исходный код компилируется в тот же байт-код, который находится в сети.",
  },
  {
    icon: bomb,
    description:
      "Вы можете просмотреть доказательства верификации и выполнить собственную проверку на стороне клиента.",
  },
  {
    icon: alert,
    description:
      "Имена переменных/функций могут не отражать фактическое использование. Компилятор может удалить неиспользуемый код.",
  },
  {
    icon: binary,
    description: "Комментарии могут быть нечестными, и их обычно следует игнорировать.",
  },
];

export const VerificationInfoBlock = () => {
  const theme = useTheme();
  const headerSpacings = useMediaQuery(theme.breakpoints.down("lg"));
  const isExtraSmallScreen = useMediaQuery("(max-width: 450px)");

  return (
    <DataBox>
      <TitleBox mb={1}>
        <CenteringBox
          sx={{
            justifyContent: "space-between",
            flexDirection: isExtraSmallScreen ? "column" : "inherit",
            width: "100%",
          }}>
          <CenteringBox mb={isExtraSmallScreen ? 2 : 0} sx={{ width: "100%" }}>
            <IconBox>
              <img src={verification} alt="Verification icon" width={41} height={41} />
            </IconBox>
            <TitleText>Как этот контракт верифицирован?</TitleText>
          </CenteringBox>
        </CenteringBox>
      </TitleBox>
      <VerificationRules makeFlexible={headerSpacings} sx={{ flexWrap: "wrap", gap: "5px" }}>
        {verificationRules.map((rule) => (
          <VerificationRule key={rule.description}>
            <CenteringWrapper sx={{ alignSelf: "flex-start" }} mr={1.5}>
              <img alt="Icon" src={rule.icon} width={41} height={41} />
            </CenteringWrapper>
            <VerificationRuleDescription>{rule.description}</VerificationRuleDescription>
          </VerificationRule>
        ))}
      </VerificationRules>
    </DataBox>
  );
};
