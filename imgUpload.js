const uuid = require("uuid")
const { S3 } = require("aws-sdk")

const s3 = new S3()
const bucket = process.env.BUCKET_NAME

function response(statusCode, content) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json", // TODO does this need to be in caps
      "Access-Control-Allow-Methods": "*", // TODO probably remove
      "Access-Control-Allow-Origin": "*", // TODO probably remove
    },
    body: JSON.stringify(content)
  }
}

async function handler(event) {
  try {
    const body = JSON.parse(event.body)
    if (body == undefined || body.image == undefined || body.mime == undefined || body.ext == undefined)
      return response(400, { message: "Bad request" })
    // TODO check image size
    const imgUuid = uuid.v4()
    await s3.putObject({
      Body: Buffer.from(body.image, "base64"),
      Key: imgUuid + "." + body.ext,
      ContentType: body.mime,
      Bucket: bucket,
      ACL: "public-read",
    }).promise()
    return response(200, {
      uuid: imgUuid,
      bucket,
      region: process.env.REGION,
    })
  } catch (err) {
    console.log("error:",err)
    return response(500, { message: "error" })
  }
}

exports.handler = handler
