export enum TokenType {
    Session,
    Plant,
    Binding,
    Measurement,
}

export type BindingTokenPayload = {
    bindingCode: number;
    tokenType: TokenType;
};
