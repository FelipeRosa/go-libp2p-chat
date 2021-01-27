package chat

type validator struct{}

func (v *validator) Validate(string, []byte) error {
	return nil
}

func (v *validator) Select(string, [][]byte) (int, error) {
	return 0, nil
}
