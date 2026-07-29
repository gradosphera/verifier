import { Link } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CompileResult, Hints, useSubmitSources } from "../lib/useSubmitSources";
import { TELEGRAM_SUPPORT_LINK } from "./Footer";

const _HintItem = styled("li")({
  maxWidth: 650,
  fontSize: 14,
  fontWeight: 400,
  marginBottom: 10,
});

function hintToElem(hint: Hints) {
  switch (hint) {
    case Hints.ENTRYPOINT_MISSING:
      return "Обычно должен быть хотя бы один файл, содержащий точку входа (recv_internal, main)";
    case Hints.STDLIB_ORDER:
      return "stdlib.fc обычно должен быть первым файлом в списке (если он не импортирован из другого файла)";
    case Hints.STDLIB_MISSING:
      return "Вы можете попробовать добавить stdlib.fc в ваши исходники.";
    case Hints.NOT_SIMILAR:
      return "Исходный код компилируется правильно, но не соответствует хешу контракта в сети. Убедитесь, что вы используете правильную версию компилятора, командную строку и порядок файлов.";
    case Hints.FILE_ORDER:
      return "Убедитесь, что все файлы в командной строке расположены в правильном порядке";
    case Hints.COMPILER_VERSION:
      return "Попробуйте использовать ту же версию компилятора, с которой был скомпилирован контракт";
    case Hints.REQUIRED_FILES:
      return "Убедитесь, что все необходимые файлы включены в командную строку";
    case Hints.SUPPORT_GROUP:
      return (
        <div>
          Если у вас всё ещё возникают проблемы, вы можете обратиться в{" "}
          <Link
            target="_blank"
            href={TELEGRAM_SUPPORT_LINK}
            sx={{
              textDecoration: "none",
              cursor: "pointer",
            }}>
            группу поддержки Telegram
          </Link>
        </div>
      );
  }
}

export const HintItem = ({ hint }: { hint: Hints }) => {
  return <_HintItem>{hintToElem(hint)}</_HintItem>;
};
