FROM alpine:3.18

RUN apk add --no-cache aws-cli tar

COPY templates/ /opt/templates/

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]