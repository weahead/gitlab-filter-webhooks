# GitLab Filter Webhooks

A Node.js service that accepts webhook requests from GitLab and based on query paramter for `ref` conditionally forwards the request to the real intended URL.

Created to be used with services that do not offer/allow/handle filtering of incoming webhooks.

Until https://gitlab.com/gitlab-org/gitlab-ce/issues/51524 is fixed/merged something like this service is needed.


## Usage

In the service that accepts webhooks from GitLab, enter the URL for this service instead, passing the desired ref in a `ref` query paramter and the indended URL in a `url` query paramter.


### Example

For service "A Service" that has a URL for incoming webhooks that looks like `https://www.a-service.com/webhook/incoming?param=one&other=two` do the following in GitLab.

Under `Settings > Integrations` for the desired repository, add the following URL:

`https://www.mydomain.com/?ref=master&url=https%3A%2F%2Fwww.a-service.com%2Fwebhook%2Fincoming%3Fparam%3Done%26other%3Dtwo`

Where `www.mydomain.com/` is where you have deployed this service.

This will:
* Make GitLab send a request to `https://www.mydomain.com/?ref=master&url=https%3A%2F%2Fwww.a-service.com%2Fwebhook%2Fincoming%3Fparam%3Done%26other%3Dtwo` with the data for the webhook event.
* This service will then check if the `master` branch is the context of the data GitLab sent.
  * If it is, then it will forward all the data to `https://www.a-service.com/webhook/incoming?param=one&other=two`, using the same HTTP method as the initial request from GitLab and passing along all headers.
  * If it isn't, then it will swallow the request (by responding with a `202 Accepted` to GitLab) and not forward any request further.


## License

[X11](LICENSE)
