import {
    extend,
    render,
    BlockStack,
    CalloutBanner,
    Text,
    useExtensionInput,
} from '@shopify/post-purchase-ui-extensions-react';

extend('Checkout::PostPurchase::ShouldRender', async ({ inputData }) => {
    // Always render to show the Thank You message
    return { render: true };
});

render('Checkout::PostPurchase::Render', () => <App />);

function App() {
    const { inputData } = useExtensionInput();

    // Retrieve the custom message from Shop Metafields
    // defined in shopify.extension.toml
    const messageMetafield = inputData?.shop?.metafields?.find(
        (m) => m.namespace === "post_purchase" && m.key === "message"
    );

    // Fallback to a default if not set
    const message = messageMetafield?.value || "Thank you for your order! (Default Message)";

    return (
        <BlockStack spacing="loose">
            <CalloutBanner title="Order Completed">
                <Text>{message}</Text>
            </CalloutBanner>
            <Text size="small" subdued>
                This is a post-purchase extension.
            </Text>
        </BlockStack>
    );
}
