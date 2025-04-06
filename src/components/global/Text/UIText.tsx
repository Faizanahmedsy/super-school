import IntlMessages from '@/app/helpers/IntlMessages';
import { cn } from '@/lib/utils';

/**
 * UIText Component
 *
 * A utility component that simplifies text translation using the `IntlMessages` helper.
 * It accepts a string as `children`, which serves as the translation key.
 * The key is passed to the `IntlMessages` component to fetch and render the translated text.
 *
 * The `as` prop specifies the HTML element to render (e.g., `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, or `p`).
 * By default, it renders a `div`. The `className` prop applies additional CSS classes to the chosen element.
 *
 * Example usage:
 * tsx
 * <UIText as="h1" className="text-xl font-bold">home.welcome</UIText>
 *
 * Assuming `home.welcome` is a valid translation key, this component will display
 * the corresponding text in the current selected language inside an `h1` tag.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.children - The translation key used for fetching the localized text.
 * @param {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div'} [props.as='div'] - The HTML tag to render.
 * @param {string} [props.className] - Additional CSS classes for styling the rendered element.
 * @returns {JSX.Element} A React element that renders the translated text inside the specified HTML element.
 */
export default function UIText({
  children,
  as: Tag = 'div',
  className,
}: {
  children: any;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';
  className?: string;
}) {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  return (
    <Tag className={cn(className)}>
      <IntlMessages id={children} />
    </Tag>
  );
}
