import { useState, useCallback } from "react";
import {
  Card,
  Page,
  Layout,
  TextField,
  Button,
  FormLayout,
  TextContainer,
  Text,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useQuery, useMutation, useQueryClient } from "react-query";

export default function HomePage() {
  const shopify = useAppBridge();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const { isLoading: isLoadingMessage } = useQuery(
    "message",
    async () => {
      const response = await fetch("/api/message");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    {
      onSuccess: (data) => {
        setMessage(data.message);
      },
      refetchOnWindowFocus: false,
    }
  );

  const mutation = useMutation(
    async (newMessage) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    {
      onSuccess: () => {
        shopify.toast.show("Message saved successfully!");
        queryClient.invalidateQueries("message");
      },
      onError: () => {
        shopify.toast.show("Failed to save message", { isError: true });
      },
    }
  );

  const handleSave = useCallback(() => {
    mutation.mutate(message);
  }, [message, mutation]);

  return (
    <Page narrowWidth>
      <TitleBar title="Post Purchase Message" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned title="Configuration">
            <FormLayout>
              <TextContainer>
                <Text as="p">
                  Enter the custom message to verify the post-purchase extension.
                </Text>
              </TextContainer>
              <TextField
                label="Post-purchase message"
                value={message}
                onChange={(value) => setMessage(value)}
                autoComplete="off"
                disabled={isLoadingMessage}
              />
              <Button primary onClick={handleSave} loading={mutation.isLoading}>
                Save Message
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
