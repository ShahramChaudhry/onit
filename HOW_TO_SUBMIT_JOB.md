# How to Submit a Job to Opus Workflow EJ8PrEHf8b4zNenS

This guide explains how to submit a job with a PDF to the Opus Job Operator API, matching the official API flow.

---

## Prerequisites

1. **API key** – Set `OPUS_API_KEY` in `.env` (your x-service-key)
2. **Workflow ID** – `EJ8PrEHf8b4zNenS` (default in this project)

---

## Job Execution Flow (API steps)

| Step | Endpoint | Purpose |
|------|----------|---------|
| 1 | `GET /workflow/{workflowId}` | Get schema & file input variable name |
| 2 | `POST /job/initiate` | Create job → get `jobExecutionId` |
| 3a | `POST /job/file/upload` | Get presigned URL and `fileUrl` |
| 3b | `PUT {presignedUrl}` | Upload PDF to S3 (**no** x-service-key) |
| 4 | `POST /job/execute` | Run workflow with `fileUrl` in payload |
| 5 | `GET /job/{jobExecutionId}/status` | Poll until COMPLETED or FAILED |
| 6 | `GET /job/{jobExecutionId}/results` | Retrieve output |

---

## Option 1: Via the App (recommended)

1. Start the app:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. In **PDF Processing**, click **Choose PDF File** and select your PDF

4. Click **Process PDF with Opus**

5. Wait for completion; results will appear in the panel.

---

## Option 2: Via cURL

```bash
# Replace YOUR_API_KEY and path/to/your/file.pdf
curl -X POST http://localhost:3001/api/opus/process-pdf \
  -F "pdf=@/path/to/your/file.pdf" \
  -F "title=My PDF Job" \
  -F "description=Processing document"
```

---

## Option 3: Via API directly (without this app)

```bash
# 1. Get workflow schema (to find file input variable name)
curl -X GET "https://operator.opus.com/workflow/EJ8PrEHf8b4zNenS" \
  -H "x-service-key: YOUR_SERVICE_KEY"

# 2. Initiate job
curl -X POST "https://operator.opus.com/job/initiate" \
  -H "Content-Type: application/json" \
  -H "x-service-key: YOUR_SERVICE_KEY" \
  -d '{"workflowId":"EJ8PrEHf8b4zNenS","title":"PDF Job","description":"Processing PDF"}'
# → Save jobExecutionId from response

# 3. Get upload URL
curl -X POST "https://operator.opus.com/job/file/upload" \
  -H "Content-Type: application/json" \
  -H "x-service-key: YOUR_SERVICE_KEY" \
  -d '{"fileExtension":".pdf","accessScope":"organization"}'
# → Save presignedUrl and fileUrl

# 4. Upload file to S3 (no x-service-key)
curl -X PUT "PRESIGNED_URL_FROM_STEP_3" \
  -H "Content-Type: application/pdf" \
  --data-binary "@/path/to/your/file.pdf"

# 5. Execute job (replace VARIABLE_NAME, FILE_URL; use jobExecutionId from step 2)
curl -X POST "https://operator.opus.com/job/execute" \
  -H "Content-Type: application/json" \
  -H "x-service-key: YOUR_SERVICE_KEY" \
  -d '{
    "jobExecutionId":"JOB_EXECUTION_ID",
    "jobPayloadSchemaInstance":{
      "VARIABLE_NAME":{"value":"FILE_URL","type":"file","displayName":"PDF Document"}
    }
  }'

# 6. Poll status (use your job ID from step 2, e.g. 9761)
curl "http://localhost:3001/api/opus/job/9761/status"

# 7. Get results (when status is COMPLETED)
curl "http://localhost:3001/api/opus/job/9761/results"
```

---

## API details

### Get Upload URL

- **POST** `https://operator.opus.com/job/file/upload`
- **Header:** `x-service-key: YOUR_SERVICE_KEY`
- **Body:** `{"fileExtension": ".pdf", "accessScope": "organization"}`
- **Response:** `presignedUrl`, `fileUrl`

### Upload File

- **PUT** to `presignedUrl` (S3)
- **Do not** use `x-service-key`
- **Header:** `Content-Type: application/pdf`
- **Body:** Raw binary of your PDF

### Execute Job

- **POST** `https://operator.opus.com/job/execute`
- **Header:** `x-service-key`, `Content-Type: application/json`
- **Body:** `jobExecutionId` + `jobPayloadSchemaInstance` with variable names as keys, each having `value`, `type`, `displayName`.
