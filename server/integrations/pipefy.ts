interface PipefyCardInput {
  name: string;
  email: string;
  company?: string;
  need?: string;
  deadline?: string;
  interestConfirmed: boolean;
  meetingLink?: string;
  meetingDatetime?: string;
}

interface PipefyCard {
  id: string;
  title: string;
}

const PIPEFY_API_URL = "https://api.pipefy.com/graphql";

async function pipefyRequest(query: string, variables: Record<string, any> = {}) {
  const token = process.env.PIPEFY_API_TOKEN;
  if (!token) {
    throw new Error("PIPEFY_API_TOKEN not configured");
  }

  const response = await fetch(PIPEFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Pipefy API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Pipefy GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

export async function findCardByEmail(email: string): Promise<PipefyCard | null> {
  const pipeId = process.env.PIPEFY_PIPE_ID;
  if (!pipeId) {
    throw new Error("PIPEFY_PIPE_ID not configured");
  }

  const query = `
    query SearchCards($pipeId: ID!, $search: String!) {
      cards(pipeId: $pipeId, search: $search, first: 1) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const data = await pipefyRequest(query, {
    pipeId,
    search: email,
  });

  const edges = data.cards?.edges || [];
  return edges.length > 0 ? edges[0].node : null;
}

export async function createCard(input: PipefyCardInput): Promise<string> {
  const pipeId = process.env.PIPEFY_PIPE_ID;
  if (!pipeId) {
    throw new Error("PIPEFY_PIPE_ID not configured");
  }

  const query = `
    mutation CreateCard($pipeId: ID!, $title: String!, $fields: [FieldValueInput!]) {
      createCard(input: {
        pipe_id: $pipeId
        title: $title
        fields_attributes: $fields
      }) {
        card {
          id
          title
        }
      }
    }
  `;

  const fields = [
    { field_id: "email", field_value: input.email },
    { field_id: "nome", field_value: input.name },
  ];

  if (input.company) {
    fields.push({ field_id: "empresa", field_value: input.company });
  }

  if (input.need) {
    fields.push({ field_id: "necessidade", field_value: input.need });
  }

  if (input.deadline) {
    fields.push({ field_id: "prazo", field_value: input.deadline });
  }

  fields.push({ 
    field_id: "interesse_confirmado", 
    field_value: input.interestConfirmed ? "true" : "false" 
  });

  if (input.meetingLink) {
    fields.push({ field_id: "meeting_link", field_value: input.meetingLink });
  }

  if (input.meetingDatetime) {
    fields.push({ field_id: "meeting_datetime", field_value: input.meetingDatetime });
  }

  const data = await pipefyRequest(query, {
    pipeId,
    title: `${input.name} - ${input.email}`,
    fields,
  });

  return data.createCard.card.id;
}

export async function updateCard(cardId: string, input: Partial<PipefyCardInput>): Promise<void> {
  const query = `
    mutation UpdateCard($cardId: ID!, $fields: [FieldValueInput!]) {
      updateCard(input: {
        id: $cardId
        fields_attributes: $fields
      }) {
        card {
          id
        }
      }
    }
  `;

  const fields: Array<{ field_id: string; field_value: string }> = [];

  if (input.interestConfirmed !== undefined) {
    fields.push({ 
      field_id: "interesse_confirmado", 
      field_value: input.interestConfirmed ? "true" : "false" 
    });
  }

  if (input.meetingLink) {
    fields.push({ field_id: "meeting_link", field_value: input.meetingLink });
  }

  if (input.meetingDatetime) {
    fields.push({ field_id: "meeting_datetime", field_value: input.meetingDatetime });
  }

  if (input.company) {
    fields.push({ field_id: "empresa", field_value: input.company });
  }

  if (input.need) {
    fields.push({ field_id: "necessidade", field_value: input.need });
  }

  if (input.deadline) {
    fields.push({ field_id: "prazo", field_value: input.deadline });
  }

  await pipefyRequest(query, { cardId, fields });
}

