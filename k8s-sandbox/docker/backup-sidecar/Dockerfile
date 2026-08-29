FROM alpine:3.18

RUN apk add --no-cache aws-cli tar

COPY run.sh /run.sh
RUN chmod +x /run.sh

# Default command (will be overridden by pod spec)
CMD ["sleep", "infinity"]