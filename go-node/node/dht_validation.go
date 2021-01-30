package node

type roomDataValidator struct{}

func (v *roomDataValidator) Validate(string, []byte) error {
	return nil
}

func (v *roomDataValidator) Select(string, [][]byte) (int, error) {
	return 0, nil
}
