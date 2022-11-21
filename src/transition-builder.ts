import { AsapState, AsapTokenizer } from "./asap-tokenizer";

export interface ITransitionBuilder<TToken> {
    getTokenizer: () => AsapTokenizer<TToken>,
    from: (stateId: number) => ITransitionBuilderWaitingForCondition<TToken>,
    addState: (id: number, state: AsapState<TToken>) => ITransitionBuilder<TToken>
}

export interface ITransitionBuilderWaitingForCondition<TToken> {
    with: (chars: string) => ITransitionBuilder<TToken>,
}

export class TransitionBuilder<TToken> implements ITransitionBuilder<TToken> {
    private tokenizer: AsapTokenizer<TToken>;
    private to: number;

    constructor(tokenizer: AsapTokenizer<TToken>, to: number) {
        this.tokenizer = tokenizer;
        this.to = to;
    }

    public getTokenizer() {
        return this.tokenizer;
    }

    public addState(id: number, state: AsapState<TToken>) {
        return this.tokenizer.addState(id, state);
    }

    public from(stateId: number): ITransitionBuilderWaitingForCondition<TToken> {
        return new TransitionBuilderWaitingForCondition<TToken>(stateId, this.to, this);
    }
}

export class TransitionBuilderWaitingForCondition<TToken> implements ITransitionBuilderWaitingForCondition<TToken> {
    constructor(from: number, to: number, builder: ITransitionBuilder<TToken>) {
        this.from = from,
        this.to = to,
        this.builder = builder;
    }

    public with(chars: string) {
        this.builder.getTokenizer().addTransition(chars, this.from, this.to);
        return this.builder;
    }

    private from: number;
    private to: number;
    private builder: ITransitionBuilder<TToken>;
}