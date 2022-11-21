export interface TokenMutator<TToken> {
    pusher: (tok: TToken) => void,
    reader: () => string
}

export type AsapState<TToken> = (tok: TokenMutator<TToken>) => void;

export class AsapTokenizer<TToken> {
    private mutator: TokenMutator<TToken> = {
        pusher: (tok) => {this.tokens.push(tok);},
        reader: () => this.input.substring(this.accFrom, this.inputPos)
    };
    private input: string = '';
    private inputLength: number = 0;
    private inputPos: number = 0;
    private accFrom: number = 0;
    private current: number = 0;
    private next: number | undefined = 0;
    private tokens: TToken[] = [];
    
    // state id to state
    private states: Map<number, AsapState<TToken>> = new Map();
    // state id to map of char to state id
    private transitions: Map<number, Map<string, number>> = new Map();

    public addState(id: number, state: AsapState<TToken>) : AsapTokenizer<TToken> {
        if (this.states.has(id)) {
            throw new Error(`Attempted to add state ${id}, but it already exists.`);
        }
        this.states.set(id, state);
        this.transitions.set(id, new Map());
        return this;
    }

    public addTransition(on: string, from: number, to: number) : AsapTokenizer<TToken> {
        const fromTransitions = this.transitions.get(from);
        if (fromTransitions === undefined) {
            throw new Error(`Attempted to add a transition ${from} -> ${to}, but ${from} doesn't exist.`);
        }
        if (!this.states.has(to)) {
            throw new Error(`Attempted to add a transition ${from} -> ${to}, but ${to} doesn't exist.`);
        }
        for (let char of on) {
            fromTransitions.set(char, to);
        }
        return this;
    }

    public tokenize(input: string): TToken[] {
        this.input = input;
        this.inputLength = this.input.length;
        this._tokenize();
        return this.tokens;
    }

    private _tokenize(): void {
        if (!this.states.has(0)) {
            throw new Error('Unable to start, initial state is missing. A state with id 0 must be provided.');
        }

        this.inputPos = 0;
        this.tokens = [];
        while (this.inputPos < this.inputLength) {
            this.current = 0;
            this.next = 5;
            this.accFrom = this.inputPos;
            while ((this.next = this.transitions.get(this.current)!.get(this.input[this.inputPos])) !== undefined) {
                ++this.inputPos;
                this.current = this.next;
                if (this.current === 0) { this.accFrom = this.inputPos; }
                if (this.inputPos === this.inputLength) { 
                    if (this.current === 0) {
                        return;
                    }
                    break; 
                }
            }
            this.states.get(this.current)!(this.mutator);
        }
    }
}
