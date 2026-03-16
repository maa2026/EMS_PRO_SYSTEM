import '../src/i18n';
import { useTranslation } from 'react-i18next';

export function withTranslation(Component) {
  return function TranslatedComponent(props) {
    const { t, i18n } = useTranslation();
    return <Component {...props} t={t} i18n={i18n} />;
  };
}
